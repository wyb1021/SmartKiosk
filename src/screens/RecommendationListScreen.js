import React from 'react'
import { FlatList, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export default function RecommendationListScreen({ route }) {
  const { items } = route.params
  const navigation = useNavigation()

  return (
    <FlatList
      data={items}
      keyExtractor={i => i._id}
      numColumns={2}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('MenuDetail', { item })}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  list: { padding: 8 },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  image: { width: '100%', height: 120, borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  category: { fontSize: 13, color: '#666' },
  price: { fontSize: 15, fontWeight: 'bold', color: '#007AFF', marginTop: 2 },
})