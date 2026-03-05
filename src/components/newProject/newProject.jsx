import { useEffect, useState } from 'react';
import {
    init,
    returnValue,
    setValueTo,
    getAllValue
} from '../../extension/storage';
import { spawnExtID } from '../../extension/check';
import { useTranslation } from '../../i18n';

import styles from './newProject.module.css';

const Input = props => (
    <input placeholder={props.placeholder} className={styles.input}
        type={props.type || "text"}
        onChange={(e) => props.setName(e.target.value)}
        value={props.nowValue}
        {...props}
    />
)
export default function NewProject(props) {
    const { t } = useTranslation();

    const [nowName, setName] = useState("");
    const [nowID, setID] = useState("");
    const [nowDesc, setDesc] = useState("");
    const [nowAuthor, setAuthor] = useState("");
    const [nowLicense, setLicense] = useState("MPL-2.0");
    const [nowEnableTranslate, setEnableTranslate] = useState(false);
    const [useCustomID, setUseCustomID] = useState(false);

    const [nowCustomLicence, setCustomLicencse] = useState('Custom');
    const [nowColor, setColor] = useState(["#0099ff", "#0066ff", "#0033ff"]);
    const [isDisabledCustomColor, setDisabledCustomColor] = useState(true)
    const [customColor, setCustomColor] = useState([false, false, false]); // 追踪每个颜色是否被自定义

    // 这个函数是AI来的，AI太好用了你知道吗
    const calculateColors = (baseColor) => {
        if (!isDisabledCustomColor) return [baseColor, nowColor[1], nowColor[2]]
        // 解析十六进制颜色
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const darken = (value, factor) => Math.round(value * factor);

        const color2 = `#${darken(r, 0.7).toString(16).padStart(2, '0')}${darken(g, 0.7).toString(16).padStart(2, '0')}${darken(b, 0.7).toString(16).padStart(2, '0')}`;
        const color3 = `#${darken(r, 0.4).toString(16).padStart(2, '0')}${darken(g, 0.4).toString(16).padStart(2, '0')}${darken(b, 0.4).toString(16).padStart(2, '0')}`;

        return [baseColor, color2, color3];
    };

    const setNameAndID = (Name) => {
        setName(Name);
        if (!useCustomID) setID(Name ? spawnExtID(Name) : "");
    }
    useEffect(() => {
        init() //扩展初始化
    }, [])

    const setComment = () => {
        const newComment = returnValue("comments");
        if (!(nowName && nowName.trim().length > 0)) {
            alert(t('Invalid extension name!'));
            return;
        }
        if (!(nowID && nowID.trim().length > 0)) {
            alert(t('Invalid extension ID!'));
            return;
        }
        newComment.name = nowName || "";
        newComment.id = nowID || "extension";
        newComment.description = nowDesc || "";
        newComment.author = nowAuthor || "";
        newComment.license = nowLicense || "MPL-2.0";
        newComment.color = nowColor || ["#0099ff", "#0066ff", "#0033ff"];
        newComment.translate = nowEnableTranslate || false;
        setValueTo("comments", newComment);
        props.Done()
    }
    return (
        <div className={styles.main}>
            <h1>{t('Create extension')}</h1>
            <Input
                setName={value => setNameAndID(value)}
                nowValue={nowName}
                placeholder={t('Name')}
            />
            <div>
                <input type="checkbox" checked={useCustomID} onChange={e => {
                    setUseCustomID(e.target.checked)
                }} />
                {t('Custom ID?')}
            </div>
            <div>{t('Extension id')}: {useCustomID ? (<input value={nowID} onChange={e => {
                setID(e.target.value)
            }} />) : (<span>{nowID}</span>)}</div>
            <Input
                setName={value => setDesc(value)}
                nowValue={nowDesc}
                placeholder={t('Description')}
            />
            <Input
                setName={value => setAuthor(value)}
                nowValue={nowAuthor}
                placeholder={t('Author')}
            />
            <select
                onChange={(e) => {
                    if (e.target.value === "Custom") {
                        setCustomLicencse(prompt("What licence do you like?"))
                        setLicense(nowCustomLicence);
                    } else {
                        setLicense(e.target.value)
                    }
                }}
                value={nowLicense}
                placeholder={t('License')}
                className={styles.input}
            >
                <option value="MPL-2.0">MPL-2.0</option>
                <option value="MIT">MIT</option>
                <option value="GPL-3.0">GPL-3.0</option>
                <option value="Apache-2.0">Apache-2.0</option>
                <option value="CC-BY-SA-4.0">CC-BY-SA-4.0</option>
                <hr />
                <option value="Custom">{t('Custom')}({nowCustomLicence})</option>
            </select>
            <div>
                {t('Custom color')}: <input type='checkbox'
                    checked={!isDisabledCustomColor}
                    onChange={(e) => setDisabledCustomColor(!e.target.checked)}
                /><br />
                {t('Enable Translate')}: <input type='checkbox'
                    checked={nowEnableTranslate}
                    onChange={(e) => setEnableTranslate(e.target.checked)}
                />
            </div>
            <div>
                <Input
                    setName={value => {
                        const newColors = calculateColors(value);
                        // 更新未自定义的颜色
                        setColor([
                            newColors[0],
                            customColor[1] ? nowColor[1] : newColors[1],
                            customColor[2] ? nowColor[2] : newColors[2]
                        ]);
                    }}
                    nowValue={nowColor[0]}
                    type="color"
                    placeholder="Color"
                    className={styles.colorInput}
                />
                <Input
                    setName={value => {
                        setColor([nowColor[0], value, nowColor[2]]);
                        setCustomColor([customColor[0], true, customColor[2]]);
                    }}
                    nowValue={nowColor[1]}
                    type="color"
                    placeholder="Color"
                    className={styles.colorInput}
                    disabled={isDisabledCustomColor}

                />
                <Input
                    setName={value => {
                        setColor([nowColor[0], nowColor[1], value]);
                        setCustomColor([customColor[0], customColor[1], true]);
                    }}
                    nowValue={nowColor[2]}
                    type="color"
                    placeholder="Color"
                    className={styles.colorInput}
                    disabled={isDisabledCustomColor}
                />

            </div>
            <button onClick={() => setComment()}>{t('Done')}</button>
        </div>
    )
}