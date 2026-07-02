import { AnalysisQueryPlan } from './planner';
import { NavigationService } from '../navigation';
import { RepositoryContext } from '../../repository/context';
export declare class AnalysisQueryExecutor {
    private navigationService;
    private repo;
    constructor(navigationService: NavigationService, repo: RepositoryContext);
    execute(plan: AnalysisQueryPlan): Promise<any[]>;
}
//# sourceMappingURL=executor.d.ts.map