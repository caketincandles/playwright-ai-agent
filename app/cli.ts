import { Command } from 'commander';
import { SetupWizard } from '@app/setup/wizard';
import { Config } from '@app/setup/config';
import * as Logger from '@lib/services/logger';

Logger.initLogging({ level: 'INFO', userFacing: true });
const logger = Logger.Log.Installation();

const program = new Command()
    .name('playwright-ai-agent')
    .description('AI-powered Playwright automation')
    .version('1.0.0');

program
    .command('--init')
    .description('Setup configuration')
    .action(async () => {
        try {
            const wizard = new SetupWizard(logger);
            const responses = await wizard.run();
            
            const writer = new Config(logger, responses);
            await writer.save();
            
            logger.success('Setup complete!');
        } catch (error) {
            logger.error('Setup failed', error);
        }
    });

program.parse();
