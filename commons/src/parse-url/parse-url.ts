/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoSubdirectoryAllowedError, WrongProtocolError } from './errors.js'
import { Optional } from '@mrdrogdrog/optional'

/**
 * Parses the given string as URL
 *
 * @param {String | undefined} url the raw url
 * @return An {@link Optional} that contains the parsed URL or is empty if the raw value isn't a valid URL
 * @throws WrongProtocolError if the protocol of the URL isn't either http nor https
 * @throws NoSubdirectoryAllowedError if the URL has more than a single path segment
 */
export function parseUrl(url: string | undefined): Optional<URL> {
  return createOptionalUrl(url)
    .guard(
      (value) => value.protocol === 'https:' || value.protocol === 'http:',
      () => new WrongProtocolError(),
    )
    .guard(
      // Serving the app under exactly one subpath (e.g. https://example.org/hedgedoc)
      // is supported. Deeper paths (e.g. /foo/bar) are not.
      (value) => value.pathname === '/' || /^\/[^/]+\/?$/.test(value.pathname),
      () => new NoSubdirectoryAllowedError(),
    )
}

function createOptionalUrl(url: string | undefined): Optional<URL> {
  try {
    return Optional.ofNullable(url).map((value) => new URL(value))
  } catch {
    return Optional.empty()
  }
}
