
import { useEffect,useState } from 'react';
import { loader } from '@monaco-editor/react';
import { monaco } from '../monacoConfig';

const useInitializeMonaco = () => {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized) {
            loader.config({ monaco });
            loader.init().then(() => {
                setInitialized(true);
            });
        }
    }, [initialized]);
};
export default useInitializeMonaco;
