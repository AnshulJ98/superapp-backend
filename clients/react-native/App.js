import React, { useEffect, useState } from "react";
import { Text, View, ScrollView, Button } from "react-native";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const gateway = "http://10.0.2.2:8080";

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch(`${gateway}/users`);
      const j = await res.json();
      setData(j);
    } catch (e) {
      setData({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text
        style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}
      >
        SuperApp Mobile (Users Demo)
      </Text>
      <Button
        title={loading ? "Loading..." : "Refresh Users"}
        onPress={loadUsers}
      />
      <ScrollView style={{ marginTop: 12 }}>
        <Text>
          {data ? JSON.stringify(data, null, 2) : "No data yet"}
        </Text>
      </ScrollView>
    </View>
  );
}
