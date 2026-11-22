import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseInterceptors
} from "@nestjs/common";
import type { Response } from "express";
import { TimingInterceptor } from "../common/timing.interceptor";
import { CreateEventDto } from "./dto/create-event.dto";
import { FindEventsQueryDto } from "./dto/find-events-query.dto";
import { EventsService } from "./events.service";
import { CreateSessionDto } from "./dto/create-session.dto";
import { ApiKeyGuard } from "../common/api-key.guard";

@UseInterceptors(TimingInterceptor)
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(
    @Query() query: FindEventsQueryDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = this.eventsService.findAll(query);
    res.setHeader("X-Total-Count", String(result.total));
    return result;
  }

  // Static routes MUST come before dynamic :id routes
  @Get("upcoming")
  findUpcoming() {
    return this.eventsService.findUpcoming();
  }

  @Get("published")
  findPublished() {
    return this.eventsService.findPublished();
  }
@Get("example")
  findPage(@Query("page", ParseIntPipe) page: number) {
    return {
      page,
      message: "Page received successfully",
    };
  }
  
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(":id/sessions")
  findSessions(@Param("id") id: string) {
    return this.eventsService.findSessionsByEventId(id);
  }

  @Get(":id/sessions/:sessionId")
  findOneSession(
    @Param("id") id: string,
    @Param("sessionId") sessionId: string
  ) {
    return this.eventsService.findOneSession(id, sessionId);
  }
  

  @Post()
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CreateEventDto) {
    return this.eventsService.create(body);
  }
  @Post(":id/sessions")
  @UseGuards(ApiKeyGuard)
@HttpCode(HttpStatus.CREATED)
createSession(
  @Param("id") id: string,
  @Body() body: CreateSessionDto
) {
  return this.eventsService.createSession(id, body);
}
}
