import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User, UserRole } from './users/entities/user.entity';
import { Store } from './stores/entities/store.entity';
import { Rating } from './ratings/entities/rating.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { RatingsModule } from './ratings/ratings.module';
import { UsersService } from './users/users.service';
import { StoresService } from './stores/stores.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): any => {
        const useSqlite = process.env.DB_FALLBACK_SQLITE === 'true';
        if (useSqlite) {
          return {
            type: 'better-sqlite3',
            database: 'database.sqlite',
            entities: [User, Store, Rating],
            synchronize: true,
          } as any;
        }
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST', '127.0.0.1'),
          port: configService.get<number>('DB_PORT', 3306),
          username: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE', 'store_rating_db'),
          entities: [User, Store, Rating],
          synchronize: true,
        } as any;
      },
    }),
    AuthModule,
    UsersModule,
    StoresModule,
    RatingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly storesService: StoresService,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.usersService.countAll();
      if (count === 0) {
        this.logger.log('Seeding initial administrator user...');
        await this.usersService.create({
          name: 'System Administrator Account',
          email: 'admin@storerating.com',
          address: 'Default System Administration Office Address',
          password: 'AdminPass123!',
          role: UserRole.ADMIN,
        });
        this.logger.log('Seeding completed. Admin Account: admin@storerating.com / AdminPass123!');
      }

      const storeCount = await this.storesService.countAll();
      if (storeCount === 0) {
        this.logger.log('Seeding initial stores...');
        const initialStores = [
          { name: 'Amazon India Store', email: 'support@amazon.in', address: 'Amazon Development Centre, Hyderabad, India' },
          { name: 'Flipkart Online Shopping', email: 'support@flipkart.com', address: 'Flipkart Internet Private Limited, Bengaluru, India' },
          { name: 'Myntra Fashion Outlet', email: 'support@myntra.com', address: 'Myntra Designs Private Limited, Bengaluru, India' },
          { name: 'Reliance Digital Electronics', email: 'info@reliancedigital.in', address: 'Reliance Retail Limited, Mumbai, India' },
          { name: 'Tata Cliq Luxury', email: 'help@tatacliq.com', address: 'Tata UniStore Limited, Mumbai, India' },
          { name: 'Nykaa Beauty Store', email: 'support@nykaa.com', address: 'FSN E-Commerce Ventures, Mumbai, India' },
          { name: 'Ajio Fashion Store', email: 'customercare@ajio.com', address: 'Reliance Retail Limited, Bangalore, India' },
          { name: 'Snapdeal Online Marketplace', email: 'help@snapdeal.com', address: 'Snapdeal Private Limited, New Delhi, India' },
          { name: 'Zomato Food Delivery', email: 'support@zomato.com', address: 'Zomato Media Private Limited, Gurgaon, India' },
          { name: 'Swiggy Food & Grocery', email: 'support@swiggy.in', address: 'Bundl Technologies Private Limited, Bangalore, India' },
          { name: 'Zepto 10-Min Delivery', email: 'help@zepto.com', address: 'KiranaKart Technologies Private Limited, Mumbai, India' },
          { name: 'Blinkit Instant Delivery', email: 'support@blinkit.com', address: 'Blinkit Commerce Private Limited, Gurgaon, India' },
          { name: 'BigBasket Online Grocery', email: 'service@bigbasket.com', address: 'Supermarket Grocery Supplies, Bangalore, India' },
          { name: 'BookMyShow Entertainment', email: 'helpdesk@bookmyshow.com', address: 'Bigtree Entertainment Private Limited, Mumbai, India' },
          { name: 'MakeMyTrip Travel', email: 'service@makemytrip.com', address: 'MakeMyTrip India Private Limited, Gurgaon, India' },
          { name: 'Goibibo Travel Bookings', email: 'feedback@goibibo.com', address: 'ibibo Group Private Limited, Gurgaon, India' },
          { name: 'Yatra Flights & Hotels', email: 'support@yatra.com', address: 'Yatra Online Private Limited, Gurgaon, India' },
          { name: 'Cleartrip Travel Agency', email: 'support@cleartrip.com', address: 'Cleartrip Private Limited, Bangalore, India' },
          { name: 'RedBus Bus Tickets', email: 'support@redbus.in', address: 'Redbus India Private Limited, Bangalore, India' },
          { name: 'Paytm Payments Store', email: 'care@paytm.com', address: 'One97 Communications Limited, Noida, India' },
          { name: 'PhonePe Storefront', email: 'support@phonepe.com', address: 'PhonePe Private Limited, Bangalore, India' },
          { name: 'Google Store India', email: 'support-in@google.com', address: 'Google India Private Limited, Gurgaon, India' },
          { name: 'Apple Store India', email: 'contact-in@apple.com', address: 'Apple India Private Limited, Mumbai, India' },
          { name: 'Samsung Digital Plaza', email: 'support@samsung.com', address: 'Samsung India Electronics, Noida, India' },
          { name: 'Croma Retail Electronics', email: 'customersupport@croma.com', address: 'Infiniti Retail Limited, Mumbai, India' },
          { name: 'Vijay Sales Electronics', email: 'customercare@vijaysales.com', address: 'Vijay Sales Corporate Office, Mumbai, India' },
          { name: 'Decathlon Sports Store', email: 'care@decathlon.in', address: 'Decathlon Sports India Private Limited, Bangalore, India' },
          { name: 'LensKart Eyewear', email: 'support@lenskart.com', address: 'Lenskart Solutions Private Limited, Delhi, India' },
          { name: 'Nykaa Fashion Store', email: 'fashion@nykaa.com', address: 'Nykaa Fashion Private Limited, Mumbai, India' },
          { name: 'Meesho Resell & Shop', email: 'help@meesho.com', address: 'Fashnear Technologies Private Limited, Bangalore, India' },
          { name: 'JioMart Online Grocery', email: 'cs@jiomart.com', address: 'Reliance Retail Limited, Navi Mumbai, India' },
          { name: 'FirstCry Kids Store', email: 'support@firstcry.com', address: 'Brainbees Solutions Private Limited, Pune, India' },
          { name: 'Pepperfry Home Furniture', email: 'cs@pepperfry.com', address: 'Trends Sutra Platform Services, Mumbai, India' },
          { name: 'Urban Ladder Furniture', email: 'hello@urbanladder.com', address: 'Urban Ladder Home Decor, Bangalore, India' },
          { name: 'IKEA Home Furnishing', email: 'support@ikea.in', address: 'IKEA India Private Limited, Hyderabad, India' },
          { name: 'H&M Fashion India', email: 'customerservice.in@hm.com', address: 'H&M Hennes & Mauritz Retail, New Delhi, India' },
          { name: 'Zara Fashion India', email: 'contact.in@zara.com', address: 'ITX Fashion India Private Limited, Mumbai, India' },
          { name: 'Nike Sports India', email: 'support.in@nike.com', address: 'Nike India Private Limited, Bangalore, India' },
          { name: 'Adidas Athletics India', email: 'care@adidas.co.in', address: 'Adidas India Private Limited, Gurgaon, India' },
          { name: 'Puma Sports India', email: 'customercare.india@puma.com', address: 'Puma Sports India Private Limited, Bangalore, India' },
          { name: 'Bewakoof Casual Wear', email: 'care@bewakoof.com', address: 'Bewakoof Brands Private Limited, Mumbai, India' },
          { name: 'The Souled Store Merch', email: 'connect@thesouledstore.com', address: 'The Souled Store Private Limited, Mumbai, India' },
          { name: 'Boat Lifestyle Audio', email: 'info@imaginemarketingindia.com', address: 'Imagine Marketing Private Limited, Mumbai, India' },
          { name: 'Noise Wearable Electronics', email: 'support@gonoise.com', address: 'Nexxbase Marketing Private Limited, Gurgaon, India' },
          { name: 'OnePlus India Store', email: 'support.in@oneplus.com', address: 'OnePlus India Technology Private Limited, Bangalore, India' },
          { name: 'Xiaomi Mi Store India', email: 'service.in@xiaomi.com', address: 'Xiaomi Technology India Private Limited, Bangalore, India' },
          { name: 'Mamaearth Beauty Care', email: 'care@mamaearth.in', address: 'Honasa Consumer Private Limited, Gurgaon, India' },
          { name: 'Sugar Cosmetics makeup', email: 'hello@sugarcosmetics.com', address: 'Vellvette Lifestyle Private Limited, Mumbai, India' },
          { name: 'The Derma Co Skincare', email: 'care@thedermaco.com', address: 'Honasa Consumer Private Limited, Gurgaon, India' },
          { name: 'Plum Goodness Beauty', email: 'hello@plumgoodness.com', address: 'Pureplay Skin Sciences Private Limited, Thane, India' },
          { name: 'Wow Skin Science Care', email: 'support@buywow.in', address: 'Body Cupid Private Limited, Bangalore, India' },
          { name: 'Forest Essentials Luxury', email: 'service@forestessentialsindia.com', address: 'Mountain Valley Springs India, New Delhi, India' }
        ];
        for (const s of initialStores) {
          await this.storesService.create(s);
        }
        this.logger.log('Stores seeding completed.');
      }
    } catch (e: any) {
      this.logger.warn('Could not seed database. If database is not connected yet, this is expected. Error: ' + e.message);
    }
  }
}
