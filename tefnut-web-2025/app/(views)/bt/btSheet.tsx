import { useStore } from '@/stores/bt/btInfo';
import { BrowserSheet } from '@/components/browser';

export default function BtSheet() {
	const btStore = useStore();

	return <BrowserSheet catchMagnet={true} defaultUrl={btStore.defaultUrl}></BrowserSheet>;
}
