import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';

/*
export default function Index() {
  return (<View><Text>(tabs)/index.tsx</Text></View>);
}
*/

export default function Index() {
    console.log('(tabs)/index.tsx')
    return <Redirect href="/map" />;
}

