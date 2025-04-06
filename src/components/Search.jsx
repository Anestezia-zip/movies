import React from 'react'
import { FaX } from 'react-icons/fa6'

const Search = ({searchTerm, setSearchTerm}) => {
  const clearSearch = () => {
    setSearchTerm(''); // Clears the search term
  }

  return (
    <div className='search'>
      <div>
        <img src="search.png" alt="search"/>

        <input
          type="text"
          placeholder="Search through thousands of movies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {searchTerm && (
          <FaX 
            className='bg-red-100 p-1 text-2xl rounded-full cursor-pointer'
            onClick={clearSearch} 
          />
        )}
      </div>
    </div>
  )
}

export default Search
