import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropdownMenu from '@/components/DropdownMenu';

export default function Navbar(): JSX.Element {

  return (
    <>
      <View style={styles.container}>
        <View style={styles.placeholder} />
        <Text style={styles.title}>HereNow</Text>
         <DropdownMenu />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 18,
    /*fontWeight: 'bold',*/
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  placeholder: {
    width: 32, // spazio per bilanciare l'icona a sinistra (se vuota)
  },
});
