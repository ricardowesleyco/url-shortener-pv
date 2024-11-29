import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUrlManagerDto  {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    url: string
}
