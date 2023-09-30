import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import { fetchEvent, updateEvent } from '../../../utils/events/fetchEvents.js';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { queryClient } from '../../../utils/react-query/queryClient.js';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async ({ event }) => {
      await queryClient.cancelQueries({
        queryKey: ['events', { id: params.id }],
      }); // will stop query data

      // rollback, if our update event failed
      // It helps us to get a previous data
      const previousEvent = queryClient.getQueryData([
        'events',
        { id: params.id },
      ]);

      // console.log(previousEvent);

      queryClient.setQueryData(['events', { id: params.id }], event);

      return { previousEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(
        ['events', { id: params.id }],
        context.previousEvent
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events', { id: params.id }]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  return (
    <Modal onClose={handleClose}>
      {isError && (
        <>
          <ErrorBlock
            title="An error occurred"
            message={
              error.info?.message ||
              'Failed to load event. Please try again later!'
            }
          />

          <Link to="/events" className="button">
            Okay
          </Link>
        </>
      )}

      {isPending && (
        <div style={{ textAlign: 'center' }}>
          <LoadingIndicator />
        </div>
      )}

      {data && (
        <EventForm inputData={data} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      )}
    </Modal>
  );
}
