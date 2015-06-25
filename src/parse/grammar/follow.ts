
module chevrotain.follow {

    import g = chevrotain.gast
    import r = chevrotain.rest
    import f = chevrotain.first
    import IN = chevrotain.constants.IN
    import lang = chevrotain.lang

    // This ResyncFollowsWalker computes all of the follows required for RESYNC
    // (skipping reference production).
    export class ResyncFollowsWalker extends r.RestWalker {
        public follows = new lang.HashTable<Function[]>()

        constructor(private topProd:g.Rule) { super() }

        startWalking():lang.HashTable<Function[]> {
            this.walk(this.topProd)
            return this.follows
        }

        walkTerminal(terminal:g.Terminal, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            // do nothing! just like in the public sector after 13:00
        }

        walkProdRef(refProd:g.NonTerminal, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            var followName = buildBetweenProdsFollowPrefix(refProd.referencedRule, refProd.occurrenceInParent) + this.topProd.name
            var fullRest:g.IProduction[] = currRest.concat(prevRest)
            var restProd = new g.Flat(fullRest)
            var t_in_topProd_follows = f.first(restProd)
            this.follows.put(followName, t_in_topProd_follows)
        }
    }

    export function computeAllProdsFollows(topProductions:g.Rule[]):lang.HashTable<Function[]> {
        var reSyncFollows = new lang.HashTable<Function[]>()

        _.forEach(topProductions, (topProd) => {
            var currRefsFollow = new ResyncFollowsWalker(topProd).startWalking()
            reSyncFollows.putAll(currRefsFollow)
        })
        return reSyncFollows
    }

    export function buildBetweenProdsFollowPrefix(inner:g.Rule, occurenceInParent:number):string {
        return inner.name + occurenceInParent + IN
    }

    export function buildInProdFollowPrefix(terminal:g.Terminal):string {
        var terminalName = tokenName(terminal.terminalType)
        return terminalName + terminal.occurrenceInParent + IN
    }

}
