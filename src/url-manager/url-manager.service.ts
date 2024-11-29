import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUrlManagerDto } from './dto/update-short-url.dto';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { nanoid } from 'nanoid'
import { InjectRepository } from '@nestjs/typeorm';
import { ShortUrlEntity } from './entities/short-url.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class UrlManagerService {
  
  constructor(
    @InjectRepository(ShortUrlEntity)
    private shortUrlRepository :Repository<ShortUrlEntity>,

  ){}

  async create(data: CreateShortUrlDto,user?: UserEntity): Promise<{shortUrl:string}> {
    const BaseApiURL:string = process.env.BASE_API_URL ?? 'localhost'
    const BaseApiPort:string = process.env.PORT ?? '3000'
    const BaseApiPrefix:string = process.env.BASE_API_PREFIX ?? 'api/v1'

    //Utils
    const APIURL:string = `${BaseApiURL}:${BaseApiPort}/${BaseApiPrefix}`

    const shortUrl:string = nanoid(6)

    const userId = user?user.id:null
    try {
      const schema = await this.shortUrlRepository.create({
        origin:data.url,
        short:shortUrl,
        userId:userId
      })      

      const entityResult = await this.shortUrlRepository.save(schema)

      return {shortUrl:`${APIURL}/${entityResult.short}`}
      
    } catch (error) {
      console.log({error})
      // REVIEW Message
      const errorMessage = error.message || 'Internal Error'
      throw new ConflictException(errorMessage)
      // REVIEW LOGGER
    }


  }

  async findAll(userId:number) :Promise<ShortUrlEntity[]>{
    return await this.shortUrlRepository.find({
      select:['origin','short','count','createdAt','updatedAt'],
      where:{userId:userId,isActive:true}
    })
  }

  async findOne(url: string): Promise<{originUrl:string}> {
    const urlEntity =  await this.shortUrlRepository.findOneBy({short:url,isActive:true})
    if (!urlEntity) {
      throw new NotFoundException()
    }
    
    await this.incrementCounter(urlEntity)
    
    return {originUrl:urlEntity.origin}
  }

  async update(url: string, updateUrlManagerDto: UpdateUrlManagerDto) {
    const urlEntity =  await this.shortUrlRepository.findOneBy({short:url,isActive:true})
    
    if (!urlEntity) {
      throw new NotFoundException()
    }
    try {
      await this.shortUrlRepository.update(urlEntity.id,{origin:updateUrlManagerDto.url})
    } catch (error) {
      console.log({error})
      // REVIEW Message
      const errorMessage = error.message || 'Internal Error'
      throw new ConflictException(errorMessage)
      // REVIEW LOGGER
    }
    return `This action updates a #${url} urlManager`;

  }

  async remove(url: string) {
    const urlEntity =  await this.shortUrlRepository.findOneBy({short:url,isActive:true})
    
    if (!urlEntity) {
      throw new NotFoundException()
    }
    try {
      const now = new Date();
      await this.shortUrlRepository.update(urlEntity.id,{isActive:false,deletedAt:now})
    } catch (error) {
      console.log({error})
      // REVIEW Message
      const errorMessage = error.message || 'Internal Error'
      throw new ConflictException(errorMessage)
      // REVIEW LOGGER
    }
    return `This action updates a #${url} urlManager`;

  }

  async incrementCounter(data: ShortUrlEntity){
    data.count += 1
    await this.shortUrlRepository.update(data.id,data)
  }
}
