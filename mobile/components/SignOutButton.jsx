import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text, TouchableOpacity ,Alert} from 'react-native'
import { styles } from "../assets/styles/home.styles"
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from "../constants/color"

export const SignOutButton = () => {
 
  const { signOut } = useClerk();

  const handleSignOut  = async () => {
  Alert.alert("Logout" ,"Are you sure to logout !",[
    {text : "Cancel" , style:"cancel"},
    {text:"Logout" , style :"destructive", onPress : signOut },
  ])
};
  return (
    <TouchableOpacity style = { styles.logoutButton }onPress={handleSignOut}>
      <Ionicons name = "log-out-outline" size={22} color={COLORS.text} />
    </TouchableOpacity>
  )
}