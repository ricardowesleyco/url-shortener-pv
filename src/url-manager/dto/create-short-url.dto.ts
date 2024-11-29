import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateShortUrlDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    url: string
}
