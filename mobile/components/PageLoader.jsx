import { View, ActivityIndicator} from 'react-native';
import {COLORS } from  "../constants/color";
import {styles} from "../assets/styles/home.styles";

const PageLoader = () => {
  return (
    <View style = {styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary}/>
    </View>
  );
};

export default PageLoader;