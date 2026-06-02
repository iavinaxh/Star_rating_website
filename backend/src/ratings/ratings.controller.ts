import { Controller, Post, Patch, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { SubmitRatingDto } from './dto/submit-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('api/ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  async submit(@Body() submitRatingDto: SubmitRatingDto, @Req() req: any) {
    return this.ratingsService.submitRating(req.user.id, submitRatingDto);
  }

  @Patch(':storeId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  async modify(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: { rating: number; comment?: string },
    @Req() req: any,
  ) {
    return this.ratingsService.submitRating(req.user.id, { storeId, rating: dto.rating, comment: dto.comment });
  }
}
