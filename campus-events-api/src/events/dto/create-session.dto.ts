import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty({ message: "title is required" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value
  )
  title!: string;

  @IsDateString({}, { message: "startsAt must be a valid ISO date string" })
  @IsNotEmpty({ message: "startsAt is required" })
  startsAt!: string;

  @IsDateString({}, { message: "endsAt must be a valid ISO date string" })
  @IsNotEmpty({ message: "endsAt is required" })
  endsAt!: string;

  @IsString()
  @IsNotEmpty({ message: "room is required" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value
  )
  room!: string;
}