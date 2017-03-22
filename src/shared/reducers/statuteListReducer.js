export default function statuteListReducer(state = {}, action) {
  switch(action.type) {
    case 'GET_STATUTES':
      return {};
    default:
      return state;
  }
}
