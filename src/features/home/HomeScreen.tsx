import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';


export default function HomeScreen() {
    return (
        <Surface style={styles.container}>

            <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Home screen...</Text>
            </Surface>

        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
