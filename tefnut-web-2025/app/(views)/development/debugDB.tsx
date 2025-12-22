import React, { useEffect, useState } from 'react';
import { TextInput, Pressable } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { ScrollView } from '@/components/ui/scroll-view';
const db = SQLite.openDatabaseSync('app.db');

export default function DebugDBScreen() {
	const [tables, setTables] = useState<string[]>([]);
	const [selectedTable, setSelectedTable] = useState<string | null>(null);
	const [rows, setRows] = useState<any[]>([]);
	const [sql, setSql] = useState("SELECT name FROM sqlite_master WHERE type='table'");
	const [result, setResult] = useState<any | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadTables();
	}, []);

	function loadTables() {
		try {
			const list = db.getAllSync("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
			const names = list.map((x: any) => x.name).filter((n: string) => n !== 'sqlite_sequence');
			setTables(names);
		} catch (e: any) {
			setError(e.message);
		}
	}

	function loadRows(table: string) {
		try {
			const data = db.getAllSync(`SELECT * FROM ${table} LIMIT 200`);
			setSelectedTable(table);
			setRows(data);
			setError(null);
		} catch (e: any) {
			setError(e.message);
		}
	}

	function runSQL() {
		try {
			const r = db.getAllSync(sql);
			console.log('SQL Result:', r);
			setResult(r);
			setError(null);
		} catch (e: any) {
			setError(e.message);
			setResult(null);
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, marginTop: 24 }} edges={['top', 'left', 'right']}>
			<ScrollView style={{ padding: 20 }}>
				<Text style={{ fontSize: 26, marginBottom: 12 }}>SQLite Debugger</Text>

				{/* 表列表 */}
				<Text style={{ fontSize: 20, marginTop: 10 }}>Tables</Text>
				{tables.map((t) => (
					<Pressable key={t} onPress={() => loadRows(t)} style={{ paddingVertical: 8 }}>
						<Text style={{ fontSize: 16, color: '#3498db' }}>{t}</Text>
					</Pressable>
				))}

				{/* 表内容 */}
				{selectedTable && (
					<View style={{ marginTop: 30 }}>
						<Text style={{ fontSize: 20, marginBottom: 8 }}>Table: {selectedTable}</Text>

						<ScrollView horizontal>
							<View>
								{rows.length === 0 && <Text style={{ color: '#888' }}>No Data</Text>}

								{rows.map((row, i) => (
									<Text key={i} style={{ fontSize: 14, marginVertical: 4 }}>
										{JSON.stringify(row)}
									</Text>
								))}
							</View>
						</ScrollView>
					</View>
				)}

				{/* SQL 控制台 */}
				<View style={{ marginTop: 40 }}>
					<Text style={{ fontSize: 20 }}>Run SQL</Text>

					<TextInput
						value={sql}
						onChangeText={setSql}
						multiline
						style={{
							borderWidth: 1,
							borderColor: '#ccc',
							marginTop: 8,
							padding: 10,
							minHeight: 80,
							borderRadius: 6,
						}}
					/>

					<Button onPress={runSQL} style={{ marginTop: 10 }}>
						Execute
					</Button>

					{error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}

					{result && (
						<View style={{ marginTop: 20 }}>
							<Text style={{ fontSize: 18 }}>Result:</Text>
							{result.map((r: any, i: any) => (
								<Text key={i} style={{ marginVertical: 4 }}>
									{JSON.stringify(r)}
								</Text>
							))}
						</View>
					)}
				</View>

				<View style={{ height: 50 }} />
			</ScrollView>
		</SafeAreaView>
	);
}
