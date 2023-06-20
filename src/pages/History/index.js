import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Header, Header2, HeaderComponent, SubMenu} from '../../component';

const History = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <Header2 title ='History' btn={() => navigation.goBack()}/>
      <View style={styles.menu}>
      <Text style={styles.titleMenu}>History Token</Text>
        <SubMenu
          titleMenu="Histori Token"
          icon="key"
          color='#16c79a'
          style={styles.subMenu}
          navigasi={() => navigation.navigate('HistoryToken')}
        />
      </View>
      <View style={styles.menu}>
      <Text style={styles.titleMenu}>History Poin</Text>
        <SubMenu
          titleMenu="Mutasi Poin"
          icon="history"
          color='#16c79a'
          style={styles.subMenu}
          navigasi={() => navigation.navigate('HistoryPoint')}
        />
      </View>
      <View style={styles.menu}>
      <Text style={styles.titleMenu}>History Order Masuk</Text>
      <SubMenu 
          titleMenu="History Order Masuk" 
          icon="cart-arrow-down" 
          color ='#65d6ce' 
          navigasi={() => navigation.navigate('HistoryOrderMasuk')}
        />
      </View>
      <View style={styles.menu}>
      <Text style={styles.titleMenu}>History Order Keluar</Text>
      <SubMenu 
          titleMenu="History Order Keluar" 
          icon="shopping-cart" 
          color ='#65d6ce' 
          navigasi={() => navigation.navigate('HistoryOrder')}
        />
      </View>
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    height: 'auto',
  },
  menu: {
    padding: 20,
  },
  titleMenu: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  line: {
    borderWidth: 5,
    borderColor: '#e8e8e8',
  },
  subMenu: {
    paddingVertical: 20,
  },
});
