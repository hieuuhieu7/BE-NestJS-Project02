import { IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateResumeDto {
    @IsNotEmpty({ message: 'URL không được để trống!' })
    url: string;

    @IsNotEmpty({ message: 'CompanyId không được để trống!' })
    @IsMongoId({ message: 'CompanyId is mongo id!' })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'JobId không được để trống!' })
    @IsMongoId({ message: 'JobId is mongo id!' })
    jobId: mongoose.Schema.Types.ObjectId;
}
