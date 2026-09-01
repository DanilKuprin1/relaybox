import { Controller, Sse } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import type { DbUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { EventsService } from './events.service.js';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Sse()
  stream(@CurrentUser() user: DbUser): Observable<{ data: string }> {
    return this.events
      .streamFor(user.id)
      .pipe(map((event) => ({ data: JSON.stringify(event) })));
  }
}
