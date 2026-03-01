import React from 'react';
import BookCard from '../components/BookCard';
import { styles } from '../styles/styles';

export default function BrowsePage({ books }) {
  return (
    <div>
      <h2 style={{fontSize: '32px', fontWeight: '900', marginBottom: '30px'}}>LIBRARY CATALOG</h2>
      <div style={styles.grid}>
        {books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}