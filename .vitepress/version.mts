/*
 * Copyright 2016-present the IoT DC3 original author or authors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'

export interface VersionInfo {
    /** Display version, e.g. "2026.9" (trimmed from the full patch version) */
    version: string
    /**
     * Full version including patch. When resolved from public/versions.json
     * this equals `latest` (versions.json carries display versions like
     * "2026.9", no patch level); only the DC3_DOCS_VERSION env path (CI
     * versioned builds) supplies a real patch version like "2026.9.22".
     */
    fullVersion: string
    /** Whether this build is the latest. Archived builds set DC3_DOCS_IS_LATEST=false */
    isLatest: boolean
}

const VERSIONS_PATH = resolve(fileURLToPath(new URL('../public/versions.json', import.meta.url)))

/**
 * Resolve the documentation version at build time.
 *
 * Resolution order:
 *   1. DC3_DOCS_VERSION env var (set by CI for versioned/archived builds)
 *   2. `latest` field in public/versions.json (feeds the VersionBanner meta)
 *   3. Fallback to "dev"
 *
 * The docs repo is standalone (decoupled from the Java platform), so the version
 * comes from versions.json rather than the parent pom.xml.
 */
export function resolveVersion(): VersionInfo {
    const envVersion = process.env.DC3_DOCS_VERSION

    if (envVersion) {
        const parts = envVersion.split('.')
        const display = parts.length >= 2 ? parts.slice(0, 2).join('.') : envVersion
        return {
            version: display,
            fullVersion: envVersion,
            isLatest: process.env.DC3_DOCS_IS_LATEST !== 'false'
        }
    }

    try {
        const data = JSON.parse(readFileSync(VERSIONS_PATH, 'utf8'))
        const latest: string | undefined = data.latest
        if (latest) {
            // fullVersion === version here: versions.json stores display versions
            // (see VersionInfo.fullVersion). The `versions` array in that file has
            // no runtime consumer since the VersionSwitcher component was removed
            // (site-5) — it remains the upgrade log for archived doc deployments.
            return {version: latest, fullVersion: latest, isLatest: true}
        }
    } catch (_) {
        // versions.json missing or malformed — fall back to "dev"
    }

    return {version: 'dev', fullVersion: 'dev', isLatest: true}
}
