import React from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import Rating from '@mui/material/Rating';

import { getPlaceById, addLike, removeLike } from '../api/places';
import { createReview, deleteReview, editReview } from '../api/reviews';
import { useParams } from 'react-router-dom';
import { getLoggedInUserId, isAdmin } from '../lib/auth';

const initialReview = {
  comment: '',
  rating: '',
};

function PlaceShow() {
  const [singlePlace, setSinglePlace] = React.useState(null);
  const [tabIsActive, setTabIsActive] = React.useState(true);
  const [review, setReview] = React.useState(initialReview);
  const { id } = useParams();
  const MAPBOX_TOKEN = `${process.env.MAP_BOX_ACCESS_TOKEN}`;

  React.useEffect(() => {
    const getData = async () => {
      const place = await getPlaceById(id);
      setSinglePlace(place);
      console.log('Lat: ', place.lat);
      console.log('Long: ', place.long);
    };

    getData();
  }, []);

  function handleTabClick(e) {
    setTabIsActive(!tabIsActive);
  }

  function handleReviewChange(e) {
    console.log(e.target.value);
    console.log('ID: ', e.target.id);
    setReview({ ...review, [e.target.id]: e.target.value });
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    const data = await createReview(id, review);
    setReview(initialReview);
    setSinglePlace(data);
  }

  async function handleDeleteReview(reviewId) {
    const data = await deleteReview(id, reviewId);
    setSinglePlace(data);
  }

  async function handleAddOrRemoveLike() {
    console.log(getLoggedInUserId());
    console.log(singlePlace.likes);
    const x = singlePlace.likes.includes((item) => {
      return item === getLoggedInUserId();
    });

    console.log('X: ', x);

    // const data = await addLike(id);
    // setSinglePlace(data);

    // const data = await removeLike(id);
    // setSinglePlace(data);
  }

  if (!singlePlace) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <section className='m-6'>
        <h1 className='title has-text-centered'>{singlePlace.name}</h1>
        <div className='columns'>
          <div className='column is-6'>
            <div className='tabs is-boxed'>
              <ul>
                <li
                  className={tabIsActive ? 'is-active' : ''}
                  data-target='image'
                  onClick={handleTabClick}
                >
                  <a>Image</a>
                </li>
                <li
                  className={tabIsActive ? '' : 'is-active'}
                  data-target='map'
                  onClick={handleTabClick}
                >
                  <a>Map</a>
                </li>
              </ul>
            </div>
            <div id='image-view' className={tabIsActive ? '' : 'is-hidden'}>
              <figure className='image'>
                <img src={singlePlace.image} alt={singlePlace.name} />
              </figure>
            </div>
            <div id='map-view' className={tabIsActive ? 'is-hidden' : ''}>
              <Map
                initialViewState={{
                  latitude: singlePlace.lat,
                  longitude: singlePlace.long,
                  zoom: 14,
                  viewport: 'fit',
                }}
                style={{ width: 100, height: 100 }}
                mapStyle='mapbox://styles/mapbox/streets-v9'
                mapboxAccessToken={MAPBOX_TOKEN}
              >
                <Marker
                  longitude={singlePlace.long}
                  latitude={singlePlace.lat}
                  color='red'
                />
              </Map>
            </div>
            <div className='has-text-centered'>
              <p>{singlePlace.likes.length}</p>
              <button
                type='button'
                className='button is-warning'
                onClick={handleAddOrRemoveLike}
              >
                {singlePlace.likes.length}
              </button>
            </div>
          </div>
          <div className='column is-6'>
            <h2 className='title has-text-centered'>About</h2>
            <p>{singlePlace.description}</p>
            <div className='columns has-text-centered'>
              <div className='column'>
                <p>{singlePlace.openingTimes}</p>
                <p>{singlePlace.contact}</p>
              </div>
              <div className='column'>
                <p>{singlePlace.stationName}</p>
                <p>{singlePlace.category}</p>
              </div>
            </div>
            <hr />
            <h2 className='title has-text-centered'>Reviews</h2>
            {console.log(getLoggedInUserId())}
            {getLoggedInUserId() && (
              <div className='form'>
                <label htmlFor='rating' className='label'>
                  Rating:
                </label>
                <input
                  type='number'
                  id='rating'
                  name='rating'
                  min='1'
                  max='5'
                  value={review.rating}
                  onChange={handleReviewChange}
                />
                {/* <Rating
                name='simple-controlled'
                id='rating'
                name='rating'
                value={review.rating}
                onChange={handleReviewChange}
              /> */}
                <label htmlFor='comment' className='label'>
                  Review:
                </label>
                <textarea
                  type='text'
                  id='comment'
                  className='input'
                  value={review.comment}
                  onChange={handleReviewChange}
                />
                <button
                  className='button mt-3'
                  type='submit'
                  onClick={handleReviewSubmit}
                >
                  Leave a Review
                </button>
              </div>
            )}
            <div className='container'>
              {singlePlace.reviews.map((review) => (
                <div className='box' key={review._id}>
                  <Rating name='read-only' value={review.rating} readOnly />
                  {(getLoggedInUserId() === review.createdBy || isAdmin()) && (
                    <button
                      type='button'
                      className='button is-danger is-small is-outlined'
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      Delete Review
                    </button>
                  )}
                  <p>{review.comment}</p>
                  <p>Reviewed by: {review.createdBy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default PlaceShow;