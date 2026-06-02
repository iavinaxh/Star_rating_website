import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      address: dto.address,
      password: hashedPassword,
      role: dto.role,
    });

    const savedUser = await this.usersRepository.save(user);

    // If role is Store Owner and storeId is provided, link them
    if (dto.role === UserRole.OWNER && dto.storeId) {
      const store = await this.storesRepository.findOne({ where: { id: dto.storeId } });
      if (store) {
        store.ownerId = savedUser.id;
        await this.storesRepository.save(store);
      }
    }

    // Don't return password in response
    const { password, ...result } = savedUser;
    return result as any;
  }

  async findAll(query: {
    name?: string;
    email?: string;
    address?: string;
    role?: UserRole;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<User[]> {
    const where: any = {};

    if (query.name) {
      where.name = Like(`%${query.name}%`);
    }
    if (query.email) {
      where.email = Like(`%${query.email}%`);
    }
    if (query.address) {
      where.address = Like(`%${query.address}%`);
    }
    if (query.role) {
      where.role = query.role;
    }

    const order: any = {};
    if (query.sortBy) {
      order[query.sortBy] = query.sortOrder || 'ASC';
    } else {
      order.id = 'DESC'; // Default sort
    }

    const users = await this.usersRepository.find({
      where,
      order,
      relations: { store: true },
    });

    // Strip passwords
    return users.map((user) => {
      const { password, ...result } = user;
      return result as any;
    });
  }

  async findOne(id: number): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { store: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    const details: any = { ...result };

    if (user.role === UserRole.OWNER && user.store) {
      // Fetch average rating of store
      const avgRatingResult = await this.ratingsRepository
        .createQueryBuilder('rating')
        .where('rating.storeId = :storeId', { storeId: user.store.id })
        .select('AVG(rating.rating)', 'avg')
        .getRawOne();
      
      const avgRating = parseFloat(avgRatingResult?.avg) || 0;
      details.storeRating = parseFloat(avgRating.toFixed(2));
    }

    return details;
  }

  async getDashboardStats(): Promise<{ totalUsers: number; totalStores: number; totalRatings: number }> {
    const totalUsers = await this.usersRepository.count();
    const totalStores = await this.storesRepository.count();
    const totalRatings = await this.ratingsRepository.count();
    return { totalUsers, totalStores, totalRatings };
  }

  // Seeding check helper
  async countAll(): Promise<number> {
    return this.usersRepository.count();
  }
}
