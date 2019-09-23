import Mustache from 'mustache';

export default function(template, user) {
  const obj = {
    recipient: user.userProfile
  };
  return Mustache.render(template, obj);
}
