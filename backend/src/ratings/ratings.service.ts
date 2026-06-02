import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { Store } from '../stores/entities/store.entity';
import { SubmitRatingDto } from './dto/submit-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  async submitRating(userId: number, dto: SubmitRatingDto): Promise<Rating> {
    // Verify store exists
    const store = await this.storesRepository.findOne({ where: { id: dto.storeId } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Check if rating already exists
    let rating = await this.ratingsRepository.findOne({
      where: { userId, storeId: dto.storeId },
    });

    if (rating) {
      rating.rating = dto.rating;
      rating.comment = dto.comment !== undefined ? dto.comment : rating.comment;
    } else {
      rating = this.ratingsRepository.create({
        userId,
        storeId: dto.storeId,
        rating: dto.rating,
        comment: dto.comment || null,
      });
    }

    return this.ratingsRepository.save(rating);
  }

  async countAll(): Promise<number> {
    return this.ratingsRepository.count();
  }
}
