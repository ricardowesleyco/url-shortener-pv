import { UserEntity } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name:'short_urls'})
export class ShortUrlEntity {
    @PrimaryGeneratedColumn()
    id:number;

    @Column({name:'origin'})
    origin:string;

    @Column({name:'short'})
    short:string;

    @Column({name:'count',default:0})
    count:number;
    
    @Column({name:'is_active'})
    isActive:boolean

    @Column({name:'user_id'})
    userId?:number

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    userEntity?: UserEntity;
  
    @CreateDateColumn({name:'created_at'})
    createdAt: Date;
  
    @UpdateDateColumn({name:'updated_at'})
    updatedAt: Date;

    @Column({name:'deleted_at',default:null})
    deletedAt?:Date
}
