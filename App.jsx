import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, Button, Image, Linking } from 'react-native';
import WebView from 'react-native-webview';
import * as rssParser from 'react-native-rss-parser';

import {
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

const RSS_URL = 'https://www.01net.com/feed/'; // Replace with your RSS feed URL

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  /*
   * To keep the template simple and small we're adding padding to prevent view
   * from rendering under the System UI.
   * For bigger apps the reccomendation is to use `react-native-safe-area-context`:
   * https://github.com/AppAndFlow/react-native-safe-area-context
   *
   * You can read more about it here:
   * https://github.com/react-native-community/discussions-and-proposals/discussions/827
   */
  const safePadding = '5%';

  const [rssItems, setRssItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const fetchRssFeed = useCallback(() => {
    setLoading(true);
    fetch(RSS_URL)
      .then(response => response.text())
      .then(responseData => rssParser.parse(responseData))
      .then(rss => {
        setRssItems(rss.items);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetchRssFeed();
  }, [fetchRssFeed]);
  const onRefresh = () => {
    setRefreshing(true);
    fetchRssFeed();
  };

  const go = (item) => {
    Linking.openURL(item.links[0].url);
  };

  const imageRegExp = /<img[^>]+src="([^">]+)"/gi;
  const renderItem = ({ item }) => {
    imageRegExp.lastIndex = 0;
    let img = imageRegExp.exec(item.description);
    return (
    <TouchableOpacity onPress={() => go(item)}>
      <View style={{ flex: 1, flexDirection:"row", paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
        <Image source={{ uri: img[1] }} style={{ width: 100, height: 100, marginRight: 10 }} />
        <View style={{ flexDirection:"column", width: '70%' }}>
          <Text style={{ fontSize: 18 }}>{item.title}</Text>
          <Text style={{ color: '#555' }}>{item.published}</Text>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      { (loading && !refreshing) ? 
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', ...backgroundStyle }} key="loading">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        : (selectedItem) ? 
            <View style={{ paddingHorizontal: safePadding, paddingBottom: safePadding, ...backgroundStyle }} key="view">
                <Button title="Back to List" onPress={() => setSelectedItem(null)} style={{ width:100, height:50 }}/>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 10 }}>{`V2 ${selectedItem.title}`}</Text>
                <WebView source={{ uri: /*selectedItem.links[0].url*/ "https://www.emmguyot.com" }} style={{ width: "900", height: "900" }} />
            </View>
        :
            <FlatList
                data={rssItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                refreshing={refreshing}
                onRefresh={onRefresh}
                style={{ backgroundColor: isDarkMode ? Colors.black : Colors.white,
                        paddingHorizontal: safePadding,
                        paddingBottom: safePadding }}
                key="liste"
                />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;

