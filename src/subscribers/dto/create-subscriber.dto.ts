import { IsArray, IsEmail, IsNotEmpty } from "class-validator";

export class CreateSubscriberDto {
    @IsNotEmpty({ message: 'Name không được để trống!' })
    name: string;

    @IsNotEmpty({ message: 'Email không được để trống!' })
    @IsEmail({ message: 'Sai cú pháp!' })
    email: string;

    @IsNotEmpty({ message: 'Skills không được để trống!' })
    @IsArray({ message: 'Skills có định dạng là array!' })
    skills: string[];
}
