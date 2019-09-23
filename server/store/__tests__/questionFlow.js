import fs from 'fs-extra';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';

jest.mock('common/constant', () => {
  return {
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_question_flow',
  };
});

let sample_questions = fs.readJsonSync('./sample/data/question_flow_default.json');

let sample_greeting_question = {
  'type': 'greeting',
  'text': '5 4th with u!'
};

beforeAll(() => {
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
  fs.outputJsonSync(
    `${constant.LOCAL_FILE_STORE_PATH}/question_flow_default.json`, 
    sample_questions,
  );
});

test('all', () => {
  let thedh = null;
  let theqf = null;
  let theup = null;
  return DataHandler.get()
    .then((dh) => {
      thedh = dh;
      return dh.getQuestionFlow();
    })
    .then((question_flow) => {
      theqf = question_flow;
      expect(theqf.findQuestionWithQid(-1)).toBe(null);
      expect(theqf.findQuestionWithQid(100000)).toBe(null);
      return thedh.getUserProgress(4);
    })
    .then((user_progress_mgr) => {
      theup = user_progress_mgr;
      
      theup.userProgress.stopAtQid = 3;
      expect(theup.findNextQid(theqf, '1.No')).toBe(19);

      theup.userProgress.stopAtQid = 3;
      expect(theup.findNextQid(theqf, '0.Yes')).toBe(4);

      theup.userProgress.stopAtQid = 2;
      expect(theup.findNextQid(theqf, '1.No')).toBe(3);

      theup.userProgress.stopAtQid = 19;
      expect(theup.findNextQid(theqf, '1.No')).toBe(21);

      theqf.questions.push(sample_greeting_question);
      return theqf.save();
    })
    .then(() => {
      let data = fs.readJsonSync(
        `${constant.LOCAL_FILE_STORE_PATH}/question_flow_default.json`,
      );
      expect(data[data.length-1]).toMatchObject(sample_greeting_question);
    });
});

afterAll(() => {
  fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
});
