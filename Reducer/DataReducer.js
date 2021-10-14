const InitialDataReducer = {
  songData: [],
  favoriteSong: [],
};

const DataReducer = (prevState, action) => {
  switch (action.type) {
    case 'SET_SONG_DATA':
      return {
        ...prevState,
        songData: action.data,
      };
    case 'SET_FAVORITE':
      return {
        ...prevState,
        favoriteSong: action.data,
      };
    case 'CLEAR_DATA':
      return {
        ...prevState,
        songData: [],
        favoriteSong: [],
      };
  }
};

export { InitialDataReducer, DataReducer };
