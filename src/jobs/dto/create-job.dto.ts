import { Type } from "class-transformer";
import { IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
}

export class CreateJobDto {
    @IsNotEmpty({ message: 'Name không được để trống!' })
    name: string;

    @IsNotEmpty({ message: 'Skills không được để trống!' })
    skills: string[];

    // Validate Company
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({ message: 'Location không được để trống!' })
    location: string;

    @IsNotEmpty({ message: 'Salary không được để trống!' })
    salary: number;

    @IsNotEmpty({ message: 'Quantity không được để trống!' })
    quantity: number;

    @IsNotEmpty({ message: 'Level không được để trống!' })
    level: string;

    @IsNotEmpty({ message: 'Description không được để trống!' })
    description: string;

    @IsNotEmpty({ message: 'Start date chỉ được truyền vào kiểu date!' })
    startDate: Date;

    @IsNotEmpty({ message: 'End date chỉ được truyền vào kiểu date!' })
    endDate: Date;

    @IsNotEmpty({ message: 'Is active chỉ được truyền vào kiểu true || false!' })
    isActive: boolean;
}
