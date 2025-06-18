import { View, Text } from 'react-native'
import React from 'react'

interface IProps {
    color?: string;
}
const TextBetweenLine = (props:IProps) => {
    const {color} = props;
  return (
    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
            <View
                style={{
                  height: 1,
                  backgroundColor: "#ccc",
                  paddingHorizontal: 35,
                }}
              />
              <Text
                style={{
                  paddingHorizontal: 10,
                  textAlign: "center",
                  fontWeight: "bold",
                  color: color?color:"white",
                }}
              >
                Login in with
              </Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: "#ccc",
                  paddingHorizontal: 35,
                }}
              />
    </View>
  )
}

export default TextBetweenLine