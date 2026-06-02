import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
  ) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    const existing = await this.storesRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Store email already registered');
    }

    let owner: User | null = null;
    if (dto.ownerId) {
      owner = await this.usersRepository.findOne({ where: { id: dto.ownerId } });
      if (!owner) {
        throw new NotFoundException('Owner user not found');
      }
      if (owner.role !== UserRole.OWNER) {
        throw new BadRequestException('The selected user is not a Store Owner');
      }
      // Check if this owner already has a store
      const existingStore = await this.storesRepository.findOne({ where: { ownerId: dto.ownerId } });
      if (existingStore) {
        throw new BadRequestException('This Store Owner already owns another store');
      }
    }

    const store = this.storesRepository.create({
      name: dto.name,
      email: dto.email,
      address: dto.address,
      ownerId: dto.ownerId || null,
    });

    return this.storesRepository.save(store);
  }

  async findAll(
    userId: number,
    query: {
      name?: string;
      address?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<any[]> {
    const qb = this.storesRepository.createQueryBuilder('store')
      .leftJoin('store.ratings', 'r')
      .select([
        'store.id AS id',
        'store.name AS name',
        'store.email AS email',
        'store.address AS address',
        'store.ownerId AS ownerId',
        'COALESCE(AVG(r.rating), 0) AS overallRating',
      ])
      .groupBy('store.id, store.name, store.email, store.address, store.ownerId');

    if (query.name) {
      qb.andWhere('store.name LIKE :name', { name: `%${query.name}%` });
    }
    if (query.address) {
      qb.andWhere('store.address LIKE :address', { address: `%${query.address}%` });
    }

    const sortOrder = query.sortOrder || 'ASC';
    if (query.sortBy === 'rating') {
      qb.orderBy('overallRating', sortOrder);
    } else if (query.sortBy === 'name') {
      qb.orderBy('store.name', sortOrder);
    } else if (query.sortBy === 'address') {
      qb.orderBy('store.address', sortOrder);
    } else {
      qb.orderBy('store.id', 'DESC');
    }

    const rawStores = await qb.getRawMany();

    // Fetch this user's ratings to add the User's Submitted Rating and Comment fields
    const userRatings = await this.ratingsRepository.find({ where: { userId } });
    const userRatingsMap = new Map<number, { rating: number; comment: string | null }>();
    userRatings.forEach((ur) => userRatingsMap.set(ur.storeId, { rating: ur.rating, comment: ur.comment }));

    return rawStores.map((store) => {
      const userRatingDetails = userRatingsMap.get(Number(store.id)) || null;
      return {
        id: Number(store.id),
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId ? Number(store.ownerId) : null,
        overallRating: parseFloat(Number(store.overallRating).toFixed(2)),
        userSubmittedRating: userRatingDetails ? userRatingDetails.rating : null,
        userSubmittedComment: userRatingDetails ? userRatingDetails.comment : null,
      };
    });
  }

  async getOwnerDashboard(
    ownerId: number,
    query: {
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<{ averageRating: number; storeName: string; ratings: any[] }> {
    const store = await this.storesRepository.findOne({ where: { ownerId } });
    if (!store) {
      throw new NotFoundException('Store not found for this owner. Please contact an admin.');
    }

    // Get average rating
    const avgResult = await this.ratingsRepository
      .createQueryBuilder('rating')
      .where('rating.storeId = :storeId', { storeId: store.id })
      .select('AVG(rating.rating)', 'avg')
      .getRawOne();
    
    const averageRating = parseFloat(parseFloat(avgResult?.avg || 0).toFixed(2));

    // Get ratings with users
    const ratingsQb = this.ratingsRepository
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.user', 'user')
      .where('rating.storeId = :storeId', { storeId: store.id });

    const sortOrder = query.sortOrder || 'DESC';
    if (query.sortBy === 'name') {
      ratingsQb.orderBy('user.name', sortOrder);
    } else if (query.sortBy === 'email') {
      ratingsQb.orderBy('user.email', sortOrder);
    } else if (query.sortBy === 'rating') {
      ratingsQb.orderBy('rating.rating', sortOrder);
    } else {
      ratingsQb.orderBy('rating.createdAt', sortOrder);
    }

    const ratings = await ratingsQb.getMany();

    const formattedRatings = ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      user: {
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
    }));

    return {
      averageRating,
      storeName: store.name,
      ratings: formattedRatings,
    };
  }

  async getStoreReviews(userId: number, userRole: string, storeId: number): Promise<any[]> {
    const store = await this.storesRepository.findOne({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const ratings = await this.ratingsRepository.find({
      where: { storeId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });

    const isAuthorizedToSeeNames =
      userRole === 'admin' ||
      (userRole === 'owner' && store.ownerId === userId);

    return ratings.map((r) => {
      const isOwnRating = r.userId === userId;
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          name: (isAuthorizedToSeeNames || isOwnRating) ? r.user.name : 'Anonymous Reviewer',
          email: (isAuthorizedToSeeNames || isOwnRating) ? r.user.email : undefined,
          address: (isAuthorizedToSeeNames || isOwnRating) ? r.user.address : undefined,
        },
      };
    });
  }

  // Seeding check helper
  async countAll(): Promise<number> {
    return this.storesRepository.count();
  }
}
