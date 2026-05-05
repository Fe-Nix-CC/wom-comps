import { WOMClient } from "@wise-old-man/utils";
import seedrandom from "seedrandom";
import { env } from "../env";
import { UTCDate } from "@date-fns/utc";
import { pickNthMetric } from "./pick_nth_metric";
import { COMP_CONFIGS } from "./comps_config";
import { getDurationInfo } from "./get_duration_info";
import { formatISO } from "date-fns";

const womClient = new WOMClient({
  userAgent: env.WOM_API_USER_AGENT,
});

async function main() {
  console.log("Duration:", env.COMP_DURATION);

  const { startsAt, endsAt, compIndex } = getDurationInfo(
    new UTCDate(),
    env.COMP_DURATION,
  );

  console.log("Start:", formatISO(startsAt));
  console.log("End:", formatISO(startsAt));

  for (const compConfig of COMP_CONFIGS) {
    const metric = pickNthMetric(
      compIndex,
      compConfig.metrics,
      seedrandom(env.WOM_GROUP_ID.toString()),
    );

    const title = compConfig.getName({ metric });

    console.log("");
    console.log(`Creating comp for '${title}'...`);

    const {
      competition: { id: competitionId, participations },
    } = await womClient.competitions.createCompetition({
      title,
      metric,
      startsAt,
      endsAt,
      groupId: env.WOM_GROUP_ID,
      groupVerificationCode: env.WOM_GROUP_KEY,
      teams: [],
    });

    console.log(`Done! Competition ID: ${competitionId}`);

    if (compConfig.excludeRegs) {
      console.log("Excluding regs...");
      const irons = participations
        .filter(({ player }) => player.type !== "regular")
        .map(({ player }) => player.username);

      await womClient.competitions.editCompetition(
        competitionId,
        { participants: irons },
        env.WOM_GROUP_KEY,
      );

      console.log(
        `Done! Old count: ${participations.length}, new count: ${irons.length}`,
      );
    }
  }
}

main();
