import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: "title is required" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  title!: string;

  @IsString()
  @IsNotEmpty({ message: "description is required" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  description!: string;

  @IsString()
  @IsNotEmpty({ message: "location is required" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  location!: string;

  @IsDateString({}, { message: "eventDate must be a valid ISO date string" })
  @IsNotEmpty({ message: "eventDate is required" })
  eventDate!: string;

  @IsString()
  @IsNotEmpty({ message: "category is required" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value
  )
  category!: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return false;
    if (typeof value === "boolean") return value;
    if (String(value).toLowerCase() === "true") return true;
    if (String(value).toLowerCase() === "false") return false;
    return value;
  })
  @IsBoolean({ message: "isPublished must be a boolean" })
  isPublished?: boolean;
}
