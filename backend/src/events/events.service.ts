import { Injectable, Logger } from '@nestjs/common';
import { defer, filter, finalize, map, Observable, Subject } from 'rxjs';
import type { RequestReceivedEvent } from './events.types.js';

type Envelope = { userId: number; event: RequestReceivedEvent };

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly stream = new Subject<Envelope>();

  publish(userId: number, event: RequestReceivedEvent): void {
    this.logger.debug(
      {
        userId,
        eventType: event.type,
        webhookPublicId: event.webhookPublicId,
        requestPublicId: event.requestPublicId,
      },
      'Publishing realtime event',
    );
    this.stream.next({ userId, event });
  }

  streamFor(userId: number): Observable<RequestReceivedEvent> {
    return defer(() => {
      this.logger.log({ userId }, 'Realtime event stream connected');
      return this.stream.asObservable().pipe(
        filter((envelope) => envelope.userId === userId),
        map((envelope) => envelope.event),
        finalize(() =>
          this.logger.log({ userId }, 'Realtime event stream disconnected'),
        ),
      );
    });
  }
}
