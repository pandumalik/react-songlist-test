import React, { useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import {
  Provider,
  Button,
  Title,
  Card,
  Paragraph,
  Divider,
  Searchbar,
  Avatar,
  Subheading,
  Headline,
  Caption,
  Appbar,
} from 'react-native-paper';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator, TransitionSpecs } from '@react-navigation/stack';
import debounce from 'lodash/debounce';
import searchResponse from './mock-data.json';
import { DataReducer, InitialDataState } from './Reducer/DataReducer';
import { DataContext } from './Context';
// import deeplink from './deeplink'
import * as Linking from "expo-linking";

const API_URL = 'https://itunes.apple.com/search?limit=10&offset=0&term=';

const SongListScreen = (props) => {
  const [dataContext, dataState] = React.useContext(DataContext);
  const [state, setState] = React.useState({
    searchKeyword: props.route.params?.keyword ?? '',
    result: [],
    url: ''
  });

  const addToFavorites = (param) => {
    let updatedFavorite = [...dataState.favoriteSong];
    if (param.isAdd) {
      updatedFavorite.push(param.data);
    } else {
      const index = updatedFavorite.findIndex((arr) => arr === param.data);
      updatedFavorite.splice(index, 1);
    }
    dataContext.setFavorite(updatedFavorite);
  };

  const onChangeText = (text) => {
    setState({
      ...state,
      searchKeyword: text,
    });
  };

  const goToFavorites = () => {
    props.navigation.navigate('Favorites');
  };

  const fetchResults = () => {
    dataContext.clearData();
    if (state.searchKeyword) {
      fetch(`${API_URL}${state.searchKeyword.replace(/\s/g, '+')}`, {
        method: 'GET',
      }).then((result) => {
        result.json().then((res) => {
          setState((prevState) => {
            return {
              ...prevState,
              result: res.results,
            };
          });
          dataContext.setSongData(res.results);
        });
      });
    }
  };

  const isInFavorites = (songData) => {
    return dataState.favoriteSong.includes(songData);
  };

  function handleDeepLink(event) {
    let data = Linking.parse(event.url);
    setState((prevState) => {
      return {
        ...prevState,
        url: data,
        searchKeyword: data.queryParams.keyword
      }
    });
  }

  useEffect(() => {
    const getUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        setState((prevState) => {
          return {
            ...prevState,
            url: Linking.parse(initialUrl),
            searchKeyword: Linking.parse(initialUrl).queryParams.keyword
          }
        });
      }
    }

    Linking.addEventListener("url", handleDeepLink);
    if (!state.url) {
      getUrl();
    }
    fetchResults();
    return () => {
      Linking.removeEventListener("url");
    };
  }, [state.url]); //actually putting this updated url state on here isn't the best way to do this, but it is what it is

  const renderItem = (songData) => (
    <SongItem
      key={songData.trackId}
      trackData={songData}
      addToFavorites={() => addToFavorites({ isAdd: true, data: songData })}
      removeFromFavorites={() =>
        addToFavorites({ isAdd: false, data: songData })
      }
      isInFavorites={isInFavorites(songData)}
    />
  );

  return (
    <>
      <Appbar.Header dark={false} style={{ backgroundColor: 'turquoise' }}>
        <Appbar.Content title="Search song" />
        <Button onPress={goToFavorites}>
          <AntDesign name="heart" size={25} color="black" />
        </Button>
      </Appbar.Header>
      <View style={styles.content}>
        <Searchbar
          placeholder="Search"
          onChangeText={onChangeText}
          value={state.searchKeyword}
          onSubmitEditing={fetchResults}
          style={{ marginBottom: 20 }}
        />
        {/* LIST OF RESULTS */}
        <ScrollView>
          {state.result.map((song) => {
            return renderItem(song);
          })}
        </ScrollView>
      </View>
    </>
  );
};

const FavoritesScreen = (props) => {
  const [dataContext, dataState] = React.useContext(DataContext);
  const [state, setState] = React.useState({
    songList: dataState?.favoriteSong ?? [],
  });

  const addToFavorites = (param) => {
    let updatedFavorite = [...dataState.favoriteSong];
    if (param.isAdd) {
      updatedFavorite.push(param.data);
    } else {
      const index = updatedFavorite.findIndex((arr) => arr === param.data);
      updatedFavorite.splice(index, 1);
    }
    dataContext.setFavorite(updatedFavorite);
  };

  const isInFavorites = (songData) => {
    return dataState.favoriteSong.includes(songData);
  };

  const goToFavorites = () => {
    alert('Already on Favorites screen');
    // props.navigation.navigate('Favorites')
  };

  const goBack = () => {
    props.navigation.goBack();
  };

  const renderItem = (songData) => (
    <SongItem
      key={songData.trackId}
      trackData={songData}
      addToFavorites={() => addToFavorites({ isAdd: true, data: songData })}
      removeFromFavorites={() =>
        addToFavorites({ isAdd: false, data: songData })
      }
      isInFavorites={isInFavorites(songData)}
    />
  );

  return (
    <>
      <Appbar.Header dark={false} style={{ backgroundColor: 'darkturquoise' }}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Appbar.Content title="Favorites" />
        <Button onPress={goToFavorites}>
          <AntDesign name="heart" size={25} color="black" />
        </Button>
      </Appbar.Header>
      <View style={styles.content}>
        {/* LIST OF FAVORITES */}
        <ScrollView>
          {state.songList.map((song, index) => {
            return renderItem(song);
          })}
        </ScrollView>
      </View>
    </>
  );
};

const SongDetailsScreen = (props) => {
  const [dataContext, dataState] = React.useContext(DataContext);
  const songData = props.route.params.trackData;

  const year = new Date(songData.releaseDate).getUTCFullYear();

  const isInFavorites = dataState.favoriteSong?.includes(songData) ?? false;

  const goBack = () => {
    props.navigation.goBack();
  };

  const goToFavorites = () => {
    props.navigation.navigate('Favorites');
  };

  const addToFavorites = (isAdd) => {
    let updatedFavorite = [...dataState.favoriteSong];
    if (isAdd) {
      updatedFavorite.push(songData);
    } else {
      const index = updatedFavorite.findIndex((arr) => arr === songData);
      updatedFavorite.splice(index, 1);
    }
    dataContext.setFavorite(updatedFavorite);
  };

  return (
    <>
      <Appbar.Header dark={false} style={{ backgroundColor: 'darkturquoise' }}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Appbar.Content title="Details" />
        <Button onPress={goToFavorites}>
          <AntDesign name="heart" size={25} color="black" />
        </Button>
      </Appbar.Header>
      <Card style={{ marginVertical: 5 }}>
        <Card.Cover
          source={{ uri: songData.artworkUrl100.replace('100x100', '600x600') }}
        />
        <Card.Content>
          <Title>{songData.artistName}</Title>
          <Headline>{songData.trackName}</Headline>
          <Subheading>{songData.collectionName}</Subheading>
          <Caption>
            {songData.primaryGenreName} ({year})
          </Caption>
        </Card.Content>
        <Card.Actions>
          <Button
            onPress={() => addToFavorites(!isInFavorites)}>
            <AntDesign
              name="heart"
              size={25}
              color={isInFavorites ? 'tomato' : 'lightgray'}
            />
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
};

const SongItem = ({
  isInFavorites,
  addToFavorites,
  removeFromFavorites,
  trackData,
}) => {
  const { navigate } = useNavigation();
  return (
    <Card style={{ marginVertical: 5 }}>
      <Card.Title
        title={
          <Title
            onPress={() =>
              navigate('SongDetails', {
                trackData: trackData,
              })
            }>
            {trackData.trackName}
          </Title>
        }
        subtitle={trackData.artistName}
        style={{ paddingVertical: 10, paddingHorizontal: 15 }}
        leftStyle={{ marginRight: 25 }}
        left={(props) => (
          <Avatar.Image
            size={50}
            source={{
              uri: trackData.artworkUrl100.replace('100x100', '600x600'),
            }}
          />
        )}
        right={() => (
          <Button
            onPress={isInFavorites ? removeFromFavorites : addToFavorites}>
            <AntDesign
              name="heart"
              size={25}
              color={isInFavorites ? 'tomato' : 'lightgray'}
            />
          </Button>
        )}
      />
    </Card>
  );
};

const Stack = createStackNavigator();

const prefix = Linking.makeUrl("/");

const App = () => {
  const [dataState, dataDispatch] = React.useReducer(
    DataReducer,
    InitialDataState
  );

  const deeplink = {
    prefixes: [prefix],
    config: {
      screens: {
        SongList: {
          path: 'songlist/:keyword',
          parse: {
            keyword: (keyword) => `${keyword}`
          }
        },
      }
    },
  };

  const dataFunc = React.useMemo(
    () => ({
      setSongData: (songData) => {
        dataDispatch({ type: 'SET_SONG_DATA', data: songData });
      },
      setFavorite: (songData) => {
        dataDispatch({ type: 'SET_FAVORITE', data: songData });
      },
      clearData: () => {
        dataDispatch({ type: 'CLEAR_DATA' });
      },
    }),
    []
  );

  return (
    <Provider>
      <NavigationContainer linking={deeplink}>
        <DataContext.Provider value={[dataFunc, dataState]}>
          <Stack.Navigator initialRouteName="SongList" headerMode="none">
            <Stack.Screen name="SongList" component={SongListScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="SongDetails" component={SongDetailsScreen} />
          </Stack.Navigator>
        </DataContext.Provider>
      </NavigationContainer>
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 8,
  },
});
