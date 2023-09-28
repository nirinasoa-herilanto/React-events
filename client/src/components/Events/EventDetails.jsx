import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '../../../utils/react-query/queryClient.js';

import { deleteEvent, fetchEvent } from '../../../utils/events/fetchEvents.js';

import Header from '../Header.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const {
    mutate,
    isPending: isPendingDelEvent,
    isError: isErrorDelEvent,
    error: deletedError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none',
      });
      navigate('/events');
    },
  });

  // console.log(`event ${params.id}`, data);

  const deleteEventHandler = () => {
    mutate({ id: params.id });
  };

  let content;

  if (isPending) {
    content = (
      <div style={{ textAlign: 'center' }}>
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || 'Failed to fetch event'}
      />
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            {isPendingDelEvent && <p>deleting event ...</p>}

            {isErrorDelEvent && (
              <ErrorBlock
                title="An error occurred"
                message={
                  deletedError.info?.message ||
                  'Failed to delete event. Please try again later!'
                }
              />
            )}

            {!isPendingDelEvent && !isErrorDelEvent && (
              <button onClick={deleteEventHandler}>Delete</button>
            )}

            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time
                dateTime={`Todo-DateT$Todo-Time`}
              >{`${formattedDate} at ${data.time}`}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Outlet />

      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      <article id="event-details">{content}</article>
    </>
  );
}
