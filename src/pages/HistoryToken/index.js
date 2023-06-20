import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { colors } from '../../utils/colors';
import Axios from 'axios';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { Header2, Releoder, ButtonCustom } from '../../component';
import { Rupiah } from '../../helper/Rupiah';
import { SafeAreaView } from 'react-native-safe-area-context';
import Config from 'react-native-config';
const wait = (timeout) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}
const ItemHistory = (props) => {
  const [color, setColor] = useState('#ffffff')
  const isFocused = useIsFocused();
  // FFCCCB FFFFCD CDFFCC CDFFCC 00FFFF
  useEffect(() => {
    if (props.status == 'closed') {
      setColor(colors.disable)
    } else {
      setColor('#00FFFF')
    }
  }, [isFocused, wait()])
  return (
    <View style={{ backgroundColor: color }}>
      <View style={{ backgroundColor: '#f2efea' }}>
        <Text
          style={{
            marginHorizontal: 20,
            paddingVertical: 8,
            color: colors.dark,
            fontWeight: 'bold',
          }}>
          {props.date}
        </Text>
      </View>
      <TouchableOpacity onPress={props.navigasi} >
        <View style={{ paddingHorizontal: 20, paddingVertical: 10, width: 400 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{props.jenis}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 8,
            }}>
            <Text style={{ color: colors.dark }}>{props.name}</Text>
            <Text style={{ color: '#000' }}>{props.code}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const HistoryOrderMasuk = ({ navigation }) => {
  const [data, setData] = useState(null);
  const userReducer = useSelector((state) => state.UserReducer);
  const TOKEN = useSelector((state) => state.TokenApi);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState();
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(false)
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setLoading(true)
      getData()
    } else {
      setPage(1)
      setData([])
    }

  }, [isFocused, page])

  const getData = async () => {
    Promise.all([apiHistory()]).then(res => {
      console.log('hasilnyaaa', res)
      if (page > 1) {
        setData(data.concat(res[0].data))
      } else {
        setData(res[0].data)
      }
      setLastPage(res[0].last_page)
      setLoading(false)
      setRefresh(false)
    }).catch(e => {
      setLoading(false)
      setRefresh(false)
    })
  };

  const apiHistory = () => {
    const promise = new Promise((resolve, reject) => {
      Axios.get(Config.API_HISTORY_TOKEN + `${userReducer.id}` + `?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Accept': 'application/json'
          }
        }
      ).then((result) => {
        console.log('hasil data1', result.data.data)
        resolve(result.data.data);
      }, (err) => {
        reject(err);
        alert('error1')
      })
    })
    return promise;
  }

  const handleLoadMore = () => {
    if (page < lastPage) {
      setPage(page + 1);
    }
  }

  const onRefresh = () => {
    setRefresh(true)

  }
  useEffect(() => {
    getData()
  }, [refresh])

  const ItemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <View
        style={{
          marginVertical: 10
        }}
      />
    );
  };

  const renderItem = ({ item }) => {
    return (
      <ItemHistory
        date={item.created_at}
        jenis={item.memo}
        code={item.code}
        navigasi={() => { navigation.navigate('HistoryTokenDetail', { data: item }) }}
        name={item.customers !=null ? item.customers.name:''}
        key={item.id}
        status={item.status}
        type={item.type}
      />
    )
  }

  if (loading) {
    return (
      <Releoder />
    )
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header2 title='History Token' btn={() => navigation.goBack()} />

        <FlatList
          // ListHeaderComponent={<Text>Hallo</Text>}
          keyExtractor={(item, index) => index.toString()}
          data={data}
          ItemSeparatorComponent={ItemSeparatorView}
          contentContainerStyle={{ alignItems: 'center' }}
          renderItem={renderItem}
          ListFooterComponent={loading ? <Text>Sedang Memuat</Text> : null}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          onRefresh={onRefresh}
          refreshing={refresh}
        />
      </View>
    </SafeAreaView>
  );
};

export default HistoryOrderMasuk;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    backgroundColor: colors.default,
    alignItems: 'center',
  },
  btnBack: {
    marginRight: 10,
  },
  textTopUp: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textTambahKartu: {
    marginTop: 10,
    color: colors.dark,
  },
});
