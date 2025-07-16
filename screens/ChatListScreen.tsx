import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

// Đảm bảo có "export default" ở đây
export default function ChatListScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.title}>Danh sách Chat</Text>
                <Text>Chức năng chat sẽ được phát triển ở đây.</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold'
    }
});