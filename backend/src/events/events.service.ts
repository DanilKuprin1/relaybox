import { Injectable } from '@nestjs/common';
import { filter, map, Observable, Subject } from 'rxjs';
import type { RequestReceivedEvent } from './events.types.js';

type Envelope = { userId: number; event: RequestReceivedEvent };

@Injectable()
export class EventsService {
  private readonly stream = new Subject<Envelope>();

  publish(userId: number, event: RequestReceivedEvent): void {
    this.stream.next({ userId, event });
  }

  streamFor(userId: number): Observable<RequestReceivedEvent> {
    return this.stream.asObservable().pipe(
      filter((envelope) => envelope.userId === userId),
      map((envelope) => envelope.event),
    );
  }
}
