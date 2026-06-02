import { Controller, Get, Post, Body, Query, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('api/stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('name') name?: string,
    @Query('address') address?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.storesService.findAll(req.user.id, { name, address, sortBy, sortOrder });
  }

  @Get('owner-dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  async getOwnerDashboard(
    @Req() req: any,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.storesService.getOwnerDashboard(req.user.id, { sortBy, sortOrder });
  }

  @Get(':id/reviews')
  async getStoreReviews(
    @Param('id', ParseIntPipe) storeId: number,
    @Req() req: any,
  ) {
    return this.storesService.getStoreReviews(req.user.id, req.user.role, storeId);
  }
}
