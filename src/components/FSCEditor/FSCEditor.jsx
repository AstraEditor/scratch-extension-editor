import styles from "./FSCEditor.module.css";

import { t } from "../../i18n";

// 这些平台Logo均不作为商业用处，仅作为展示使用
import tw from './platform/tw.svg';
import FZcode from "./platform/40code.png";
import gandi from "./platform/gandi.png";
import ZTengine from "./platform/02engine.png";
import clipcc from "./platform/clipcc.svg";
import zerocat from "./platform/zerocat.png";
import ae from './platform/ae.svg'

import hotReloadService from "../../extension/HotReloadService.js";

import { useEffect } from "react";

const FSCEditor = props => {
    const ext = props.fscData;

    const platform = {
        tw: { name: "TurboWarp", color: "#ff4c4c" },
        ae: { name: "AstraEditor", color: "#0099ff" },
        "02engine": { name: "02Engine", color: "#01b8ac" },
        clipcc: { name: "ClipCC", color: "#0072F5" },
        mblock: { name: "mBlock", color: "#1EAAFF" },
        gandi: { name: "Gandi", color: "#17b6f3" },
        zerocat: { name: "ZeroCat", color: "#1867c0" },
        "40code": { name: "40Code", color: "#1867c0" },
    }
    const getPlatform = name => {
        if (platform[name]) return platform[name].name;
        return name;
    }
    const getPlatformColor = name => {
        if (platform[name]) return platform[name].color;
        return "var(--text-color)";
    }

    const getPlatformLogo = name => {
        const pfName = getPlatform(name);
        const img = pf => `<img class=${styles.platformLogo} src="${pf}" alt="${pfName}"/>`;
        if (name === "tw") return img(tw);
        if (name === "40code") return img(FZcode);
        if (name === "gandi") return img(gandi);
        if (name === "02engine") return img(ZTengine);
        if (name === "clipcc") return img(clipcc)
        if (name === "zerocat") return img(zerocat);
        if (name === "ae") return img(ae);

        return null;
    }

    useEffect(() => {
        const hotreload = async () => {
            const result = await hotReloadService.hotReload();
            console.log(result);
            console.log("refreshed!")
        }
        hotreload();
    }, [ext])

    return (
        <div className={styles.fscEditor}>
            <div>
                <h1>{ext.name}</h1>
                <p>{ext.id}</p>
                <p>{ext.description}</p>
                <p>{ext.version}</p>
            </div>
            <div>
                <div>
                    <h3>{t('Supported platforms')}</h3>
                    {ext.platform.map(name => (
                        <div className={styles.platformDiv} key={name}>
                            <div dangerouslySetInnerHTML={{ __html: getPlatformLogo(name) }} />
                            <p style={{ color: getPlatformColor(name) }} key={name}>
                                {getPlatform(name)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FSCEditor