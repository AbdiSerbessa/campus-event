import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class FindEventsQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "boolean") return value;
    if (String(value).toLowerCase() === "true") return true;
    if (String(value).toLowerCase() === "false") return false;
    return value;
  })
  @IsBoolean({ message: "isPublished must be true or false" })
  isPublished?: boolean;

  @IsOptional()
  @IsIn(["eventDate", "title"], {
    message: "sortBy must be either 'eventDate' or 'title'",
  })
  sortBy?: "eventDate" | "title";

  @IsOptional()
  @IsIn(["asc", "desc"], {
    message: "order must be either 'asc' or 'desc'",
  })
  order?: "asc" | "desc";

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "page must be an integer" })
  @Min(1, { message: "page must be at least 1" })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "limit must be an integer" })
  @Min(1, { message: "limit must be at least 1" })
  limit?: number;

  @IsOptional()
  @IsDateString({}, { message: "dateFrom must be a valid ISO date string" })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: "dateTo must be a valid ISO date string" })
  dateTo?: string;
}
