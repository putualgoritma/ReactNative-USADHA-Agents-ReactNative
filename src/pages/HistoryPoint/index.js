import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View,FlatList,Dimensions } from 'react-native';
import {colors} from '../../utils/colors';
import {useDispatch, useSelector} from 'react-redux';
import Axios from 'axios';
import {Header2, Releoder} from '../../component';
import { Rupiah } from '../../helper/Rupiah';
import { SafeAreaView } from 'react-native-safe-area-context';
import Config from 'react-native-config';
import {useIsFocused} from '@react-navigation/native';
const ItemHistory = (props) => {
  var color = '#61b15a';

  if(props.type == 'C'){
    color = 'red'
  }

  return (
    <View style={{alignItems:'center', width:400}}>
      <View style={{backgroundColor: '#f2efea',width:400}}>
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
      <View >
        <Text style={{fontWeight: 'bold', fontSize: 15}}>{props.jenis}</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
          }}>
          <Text style={{color: color}}>{props.type == 'D' ? 'Debet' : 'Kredit'}</Text>
          <Text style={{color: color}}>{Rupiah(parseInt(props.total))}</Text>
        </View>
      </View>
    </View>
  );
};

const HistoryPoint = ({navigation}) => {
  const userReducer = useSelector((state) => state.UserReducer);
  const TOKEN = useSelector((state) => state.TokenApi);
  const [dataHistory, setDataHistory] = useState({}); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState();
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
    Axios.get(Config.API_HISTORY_POINT + `${userReducer.id}`+`?page=${page}`, 
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Accept' : 'application/json' 
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
    date={item.orders.register}
    jenis={item.memo}
    total={item.amount}
    type = {item.type}
    key = {item.id}
    />
  )
}
  if (loading) {
    return (
      <Releoder/>
    )
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header2 title ='History Point' btn={() => navigation.goBack()}/>
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

export default HistoryPoint;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
