import { useQuery } from '@tanstack/react-query';

import { fetchEvents } from '../../../utils/events/fetchEvents.js';

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';

export default function NewEventsSection() {
  // const { data, isPending, isError, error } = useQuery({
  //   queryKey: ['events', {max: 3}],
  //   queryFn: ({ signal }) => fetchEvents({ signal, max: 3 }),
  //   staleTime: 5000,
  //   // gcTime: 30000 // by default 5 mins
  // });

  // or with accessing queryKey
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', { max: 3 }],
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    staleTime: 5000,
    // gcTime: 30000 // by default 5 mins
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || 'Failed to fetch events'}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
