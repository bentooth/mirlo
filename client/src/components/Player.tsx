import React from "react";
import { css } from "@emotion/css";
import { Helmet } from "react-helmet";

import { Link } from "react-router-dom";
import { bp } from "../constants";
import ImageWithPlaceholder from "./common/ImageWithPlaceholder";
import { AudioWrapper } from "./AudioWrapper";
import Spinner from "./common/Spinner";
import { useGlobalStateContext } from "state/GlobalState";
import api from "services/api";
import { isTrackOwnedOrPreview } from "utils/tracks";
import LoopButton from "./common/LoopButton";
import ShuffleButton from "./common/ShuffleButton";
import NextButton from "./common/NextButton";
import PauseButton from "./common/PauseButton";
import PlayButton from "./common/PlayButton";
import PreviousButton from "./common/PreviousButton";
import { isEmpty } from "lodash";

const playerClass = css`

  border-bottom: 1px solid grey;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
  width: 100%;
  z-index: 10;
  bottom: 0;
  filter: drop-shadow(0 0 0.1rem rgba(0, 0, 0, 0.5));
  background-color: var(--mi-light-background-color);

  @media (max-width: ${bp.small}px) {
    // height: 140px;
    flex-direction: column;

    button {
    }
  }
`;

const Player = () => {
  const {
    state: { playerQueueIds, currentlyPlayingIndex, user, playing },
    dispatch,
  } = useGlobalStateContext();
  // let navigate = useNavigate();
  const [currentTrack, setCurrentTrack] = React.useState<Track>();
  const [isLoading, setIsLoading] = React.useState(false);
  const userId = user?.id;

  const fetchTrackCallback = React.useCallback(
    async (id: number) => {
      setIsLoading(true);
      try {
        const { result } = await api.get<Track>(`tracks/${id}`);

        if (userId) {
          setCurrentTrack(result);
        } else {
          setCurrentTrack(result);
        }
      } catch {
        setCurrentTrack(undefined);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const currentTrackId = currentTrack?.id;
  const playerQueueIdAtIndex =
    currentlyPlayingIndex !== undefined &&
    playerQueueIds?.[currentlyPlayingIndex];

  const playerQueueIdsLength = playerQueueIds.length;

  // FIXME: Something is causing this to trigger twice and
  // call the above callback twice.
  React.useEffect(() => {
    if (playerQueueIdsLength && playerQueueIdAtIndex) {
      if (currentTrackId !== playerQueueIdAtIndex) {
        // setCurrentTrack(undefined);
        fetchTrackCallback(playerQueueIdAtIndex);
      }
    } else {
      setCurrentTrack(undefined);
    }
  }, [
    fetchTrackCallback,
    playerQueueIdsLength,
    playerQueueIdAtIndex,
    currentTrackId,
  ]);

  React.useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        dispatch({ type: "incrementCurrentlyPlayingIndex" });
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        dispatch({ type: "decrementCurrentlyPlayingIndex" });
      });
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (currentTrack) {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist:
            currentTrack.trackArtists
              ?.filter((ta) => ta.isCoAuthor)
              .map((ta) => ta.artistName)
              .join(", ") ??
            currentTrack.trackGroup?.artist?.name ??
            "",
          album: currentTrack.trackGroup?.title ?? "",
          artwork: [
            {
              src: currentTrack.trackGroup.cover?.sizes?.[1200] ?? "",
              type: "image/png",
            },
          ],
        });
      }
    }
  }, [currentTrack]);

  if (!currentTrack || isEmpty(currentTrack.trackGroup)) {
    return null;
  }

  return (
    <div className={playerClass}>
      <Helmet>
        <title>
          {currentTrack
            ? `${currentTrack.trackGroup?.artist?.name} - ${currentTrack.title}`
            : ""}
        </title>

      </Helmet>
      <div
        className={css`
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-grow: 1;
          margin-bottom: 0.25rem;
          background-color: var(--mi-normal-background-color);

          @media (max-width: ${bp.small}px) {
            width: 100%;
            flex-grow: initial;
          }
        `}
      >
        {currentTrack && isTrackOwnedOrPreview(currentTrack, user) && (
          <AudioWrapper currentTrack={currentTrack} />
        )}
      </div>

      <div>
        <div
          className={css`
            display: flex;
            align-items: center;
            flex-grow: 1;
            paddin-right: 0.5rem;
            font-size: 16px;
            justify-content: space-between;
            background-color: var(--mi-normal-background-color);

            @media (max-width: ${bp.small}px) {
              flex-grow: initial;
              justify-content: space-between;
            }
          `}
        >
          <div
            className={css`
              width: 40%;
              flex: 40%;
              display: flex;
              align-items: center;

              margin-right: 1rem;
              margin-left: .5rem;
              margin-bottom: 0.5rem;
              margin-top: 0.5rem;
            `}
          >
            <ImageWithPlaceholder
              src={currentTrack?.trackGroup.cover?.sizes?.[120]}
              size={45}
              alt={currentTrack?.title ?? "Loading album"}
              className={css`
                background-color: #efefef;
                margin-right: 0.5rem;
                min-height: 100%;
                min-width: 50px;
              `}
            />
            <div
              className={css`
                width:80%;
                display: flex;
                flex-direction: column;
              `}
            >
              <div
              className={css`
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              `}
              >{currentTrack?.title}</div>
              {currentTrack?.trackGroup && (
                <>
                  <div
                  className={css`
                    font-size: .7rem;
                    text-transform: capitalize;
                    color: var(--mi-light-foreground-color);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  `}
                  >{currentTrack.trackGroup.title}</div>
                  <div
                  className={css`
                    font-size: .7rem;
                    text-transform: capitalize;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    }
                  `}
                  >
                    <Link to={`/${currentTrack.trackGroup.artistId}`}>
                      {currentTrack.trackGroup.artist?.name}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* <TrackPopup trackId={currentTrack.id} compact /> */}
          <div
            className={css`
              display: inline-block;

              button {
                margin-right: 0.25rem;
              }
            `}
          >
            <span
            className={css`
              display: flex;
              align-items: center;

              button {
                background: transparent;
                font-size: 1rem;
              }
              button:hover {
                color: var(--mi-normal-foreground-color) !important;
                background: var(--mi-normal-background-color) !important;
              }

              @media (max-width: ${bp.small}px) {
                margin-right: .5rem;
                max-width: 50%
              }
            `}>
            <span
              className={css`
                display: flex;
                align-items: center;

                button {
                  background-color: transparent;
                }

                @media (max-width: ${bp.small}px) {
                  display: none;
                }
              `}
            >
              <ShuffleButton />
              <LoopButton />
            </span>
              <div
              className={css`

                @media (max-width: ${bp.small}px) {
                    button {
                      padding: 0em .5em 0em 0em;
                      background: transparent;
                    }
              `}
              >
              <PreviousButton />
              </div>
              <div
              className={css`
                    button {
                      color: var(--mi-normal-foreground-color);
                      font-size: 1rem !important;

                      button:hover {
                        color: var(--mi-normal-foreground-color) !important;
                      }
                    }
              `}
              >
              {!playing && <PlayButton />}
              {playing && <PauseButton />}
              </div>
              <div
              className={css`

                @media (max-width: ${bp.small}px) {
                    button {

                      padding: 0em 0em 0em .5em;
                      background: transparent;
                    }
              `}
              >
              <NextButton />
              </div>
            </span>
          </div>
        </div>

        {!currentTrack && isLoading && <Spinner size="small" />}
      </div>
    </div>
  );
};

export default Player;
